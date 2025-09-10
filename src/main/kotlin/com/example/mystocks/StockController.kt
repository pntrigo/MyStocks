package com.example.mystocks

import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import java.io.ByteArrayOutputStream
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.apache.poi.ss.usermodel.WorkbookFactory
import org.springframework.web.multipart.MultipartFile
import org.slf4j.LoggerFactory

@CrossOrigin(origins = ["http://localhost:3000"])
@RestController
class StockController @Autowired constructor(
    private val portfolioRepository: PortfolioRepository,
    private val stockPriceService: StockPriceService
) {
    private val logger = LoggerFactory.getLogger(StockController::class.java)

    private val stocks = listOf(
        Stock(symbol = "AAPL", price = 189.12),
        Stock(symbol = "GOOGL", price = 2735.45),
        Stock(symbol = "MSFT", price = 299.35),
        Stock(symbol = "AMZN", price = 3450.16),
        Stock(symbol = "TSLA", price = 730.91)
    )

    @GetMapping("/getStock")
    fun getStock(@RequestParam(required = false) symbol: String?): Stock {
        return stocks.find { it.symbol.equals(symbol, ignoreCase = true) } ?: stocks[0]
    }

    @GetMapping("/getStocks")
    fun getStocks(): List<Stock> = stocks

    @PostMapping("/portfolio")
    fun addToPortfolio(@RequestBody entry: PortfolioEntry): List<PortfolioViewEntry> {
        val newEntry = PortfolioEntry(symbol = entry.symbol, quantity = entry.quantity)
        portfolioRepository.save(newEntry)
        return portfolioRepository.findAll().map {
            val metrics = stockPriceService.getStockMetrics(it.symbol)
            PortfolioViewEntry(
                id = it.id,
                symbol = it.symbol,
                quantity = it.quantity,
                price = metrics.price,
                percentChangeToday = metrics.percentChangeToday,
                peRatio = metrics.peRatio
            )
        }
    }

    @GetMapping("/portfolio")
    fun getPortfolio(): List<PortfolioViewEntry> = portfolioRepository.findAll().map {
        val metrics = stockPriceService.getStockMetrics(it.symbol)
        PortfolioViewEntry(
            id = it.id,
            symbol = it.symbol,
            quantity = it.quantity,
            price = metrics.price,
            percentChangeToday = metrics.percentChangeToday,
            peRatio = metrics.peRatio
        )
    }

    @PostMapping("/portfolio/edit")
    fun editPortfolio(@RequestBody entry: PortfolioEntry): List<PortfolioViewEntry> {
        if (entry.id == null) throw IllegalArgumentException("ID required for edit")
        val existing = portfolioRepository.findById(entry.id)
        if (existing.isPresent) {
            val updated = existing.get().copy(quantity = entry.quantity, symbol = entry.symbol)
            portfolioRepository.save(updated)
        }
        return portfolioRepository.findAll().map {
            val metrics = stockPriceService.getStockMetrics(it.symbol)
            PortfolioViewEntry(
                id = it.id,
                symbol = it.symbol,
                quantity = it.quantity,
                price = metrics.price,
                percentChangeToday = metrics.percentChangeToday,
                peRatio = metrics.peRatio
            )
        }
    }

    @PostMapping("/portfolio/delete")
    fun deletePortfolio(@RequestBody req: PortfolioDeleteRequest): List<PortfolioViewEntry> {
        if (req.id == null) throw IllegalArgumentException("ID required for delete")
        portfolioRepository.deleteById(req.id)
        return portfolioRepository.findAll().map {
            val metrics = stockPriceService.getStockMetrics(it.symbol)
            PortfolioViewEntry(
                id = it.id,
                symbol = it.symbol,
                quantity = it.quantity,
                price = metrics.price,
                percentChangeToday = metrics.percentChangeToday,
                peRatio = metrics.peRatio
            )
        }
    }

    @GetMapping("/portfolio/export")
    fun exportPortfolio(): ResponseEntity<ByteArray> {
        try {
            val headers = HttpHeaders()
            headers.contentType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=portfolio.xlsx")
            val out = ByteArrayOutputStream()
            val workbook = XSSFWorkbook()
            val sheet = workbook.createSheet("Portfolio")
            val header = sheet.createRow(0)
            header.createCell(0).setCellValue("Symbol")
            header.createCell(1).setCellValue("Quantity")
            // Minimal valid row
            val row = sheet.createRow(1)
            row.createCell(0).setCellValue("AAPL")
            row.createCell(1).setCellValue(10.0)
            workbook.write(out)
            workbook.close()
            val bytes = out.toByteArray()
            out.close()
            logger.info("Exported Excel file size: ${'$'}{bytes.size}")
            headers.contentLength = bytes.size.toLong()
            return ResponseEntity.ok().headers(headers).body(bytes)
        } catch (ex: Exception) {
            logger.error("Failed to export Excel file", ex)
            return ResponseEntity.internalServerError().body(byteArrayOf())
        }
    }

    @PostMapping("/portfolio/import")
    fun importPortfolio(@RequestPart("file") file: MultipartFile): ResponseEntity<String> {
        val workbook = WorkbookFactory.create(file.inputStream)
        val sheet = workbook.getSheetAt(0)
        val rows = sheet.iterator()
        if (!rows.hasNext()) {
            workbook.close()
            return ResponseEntity.badRequest().body("Excel file is empty or missing header.")
        }
        val header = rows.next()
        val symbolIdx = (0 until header.physicalNumberOfCells).find { header.getCell(it)?.stringCellValue?.trim()?.equals("Symbol", true) == true } ?: -1
        val qtyIdx = (0 until header.physicalNumberOfCells).find { header.getCell(it)?.stringCellValue?.trim()?.equals("Quantity", true) == true } ?: -1
        if (symbolIdx == -1 || qtyIdx == -1) {
            workbook.close()
            return ResponseEntity.badRequest().body("Excel file must have 'Symbol' and 'Quantity' columns as the first row.")
        }
        val imported = mutableListOf<PortfolioEntry>()
        while (rows.hasNext()) {
            val row = rows.next()
            val symbolCell = row.getCell(symbolIdx)
            val qtyCell = row.getCell(qtyIdx)
            val symbol = symbolCell?.stringCellValue?.trim()
            val quantity = qtyCell?.numericCellValue
            if (symbol.isNullOrBlank() || quantity == null || quantity.isNaN()) continue
            imported.add(PortfolioEntry(symbol = symbol, quantity = quantity))
        }
        portfolioRepository.deleteAll()
        portfolioRepository.saveAll(imported)
        workbook.close()
        return ResponseEntity.ok("Portfolio imported successfully. Imported: ${imported.size} entries.")
    }

    @GetMapping("/portfolio/template")
    fun downloadPortfolioTemplate(): ResponseEntity<ByteArray> {
        return try {
            val headers = HttpHeaders()
            headers.contentType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=portfolio_template.xlsx")
            val out = ByteArrayOutputStream()
            val workbook = XSSFWorkbook()
            val sheet = workbook.createSheet("Portfolio Template")
            val header = sheet.createRow(0)
            header.createCell(0).setCellValue("Symbol")
            header.createCell(1).setCellValue("Quantity")
            workbook.write(out)
            workbook.close()
            val bytes = out.toByteArray()
            out.close()
            logger.info("Exported template Excel file size: ${'$'}{bytes.size}")
            headers.contentLength = bytes.size.toLong()
            ResponseEntity.ok().headers(headers).body(bytes)
        } catch (ex: Exception) {
            logger.error("Failed to export template Excel file", ex)
            ResponseEntity.internalServerError().body(byteArrayOf())
        }
    }

    @GetMapping("/test-excel")
    fun testExcel(): ResponseEntity<ByteArray> {
        return try {
            val workbook = XSSFWorkbook()
            val sheet = workbook.createSheet("Test")
            val row = sheet.createRow(0)
            row.createCell(0).setCellValue("Test")
            row.createCell(1).setCellValue(123.0)

            val baos = ByteArrayOutputStream()
            workbook.write(baos)
            workbook.close()

            val headers = HttpHeaders()
            headers.add("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            headers.add("Content-Disposition", "attachment; filename=test.xlsx")

            ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray())
        } catch (e: Exception) {
            logger.error("Test Excel failed", e)
            ResponseEntity.internalServerError().build()
        }
    }
}

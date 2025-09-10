package com.example.mystocks

import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.beans.factory.annotation.Autowired

@CrossOrigin(origins = ["http://localhost:3000"])
@RestController
class StockController @Autowired constructor(
    private val portfolioRepository: PortfolioRepository,
    private val stockPriceService: StockPriceService
) {
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
            PortfolioViewEntry(
                id = it.id,
                symbol = it.symbol,
                quantity = it.quantity,
                price = stockPriceService.getLatestPrice(it.symbol)
            )
        }
    }

    @GetMapping("/portfolio")
    fun getPortfolio(): List<PortfolioViewEntry> = portfolioRepository.findAll().map {
        PortfolioViewEntry(
            id = it.id,
            symbol = it.symbol,
            quantity = it.quantity,
            price = stockPriceService.getLatestPrice(it.symbol)
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
            PortfolioViewEntry(
                id = it.id,
                symbol = it.symbol,
                quantity = it.quantity,
                price = stockPriceService.getLatestPrice(it.symbol)
            )
        }
    }

    @PostMapping("/portfolio/delete")
    fun deletePortfolio(@RequestBody req: PortfolioDeleteRequest): List<PortfolioViewEntry> {
        if (req.id == null) throw IllegalArgumentException("ID required for delete")
        portfolioRepository.deleteById(req.id)
        return portfolioRepository.findAll().map {
            PortfolioViewEntry(
                id = it.id,
                symbol = it.symbol,
                quantity = it.quantity,
                price = stockPriceService.getLatestPrice(it.symbol)
            )
        }
    }
}

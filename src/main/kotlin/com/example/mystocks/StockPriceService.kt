package com.example.mystocks

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder
import org.json.JSONObject
import org.slf4j.LoggerFactory

data class StockMetrics(
    val price: Double?,
    val percentChangeToday: Double?,
    val peRatio: Double?
)

@Service
class StockPriceService(
    @Value("\${finnhub.api_key}") private val apiKey: String
) {
    private val restTemplate = RestTemplate()
    private val logger = LoggerFactory.getLogger(StockPriceService::class.java)

    fun getLatestPrice(symbol: String): Double? {
        val url = UriComponentsBuilder.fromHttpUrl("https://finnhub.io/api/v1/quote")
            .queryParam("symbol", symbol)
            .queryParam("token", apiKey)
            .toUriString()
        val response = restTemplate.getForObject(url, String::class.java) ?: return null
        logger.info("Finnhub response for $symbol: $response")
        val json = JSONObject(response)
        val price = json.optDouble("c", Double.NaN)
        if (price.isNaN()) {
            logger.warn("No price found for symbol $symbol in Finnhub response.")
            return null
        }
        return price
    }

    fun getStockMetrics(symbol: String): StockMetrics {
        // Get quote (price and percent change)
        val quoteUrl = UriComponentsBuilder.fromHttpUrl("https://finnhub.io/api/v1/quote")
            .queryParam("symbol", symbol)
            .queryParam("token", apiKey)
            .toUriString()
        val quoteResponse = restTemplate.getForObject(quoteUrl, String::class.java)
        logger.info("Finnhub quote response for $symbol: $quoteResponse")
        val quoteJson = quoteResponse?.let { JSONObject(it) } ?: JSONObject()
        val price = quoteJson.optDouble("c", Double.NaN)
        val prevClose = quoteJson.optDouble("pc", Double.NaN)
        val percentChangeToday = if (!price.isNaN() && !prevClose.isNaN() && prevClose != 0.0) {
            ((price - prevClose) / prevClose) * 100.0
        } else null

        // Get PE ratio
        val metricUrl = UriComponentsBuilder.fromHttpUrl("https://finnhub.io/api/v1/stock/metric")
            .queryParam("symbol", symbol)
            .queryParam("metric", "all")
            .queryParam("token", apiKey)
            .toUriString()
        val metricResponse = restTemplate.getForObject(metricUrl, String::class.java)
        logger.info("Finnhub metric response for $symbol: $metricResponse")
        val metricJson = metricResponse?.let { JSONObject(it) } ?: JSONObject()
        val peRatio = metricJson.optJSONObject("metric")?.optDouble("peBasicExclExtraTTM", Double.NaN)

        return StockMetrics(
            price = if (!price.isNaN()) price else null,
            percentChangeToday = percentChangeToday,
            peRatio = if (peRatio != null && !peRatio.isNaN()) peRatio else null
        )
    }
}

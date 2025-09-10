package com.example.mystocks

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder
import org.json.JSONObject
import org.slf4j.LoggerFactory

@Service
class StockPriceService(
    @Value("\${alpha_vantage.api_key}") private val apiKey: String
) {
    private val restTemplate = RestTemplate()
    private val logger = LoggerFactory.getLogger(StockPriceService::class.java)

    fun getLatestPrice(symbol: String): Double? {
        val url = UriComponentsBuilder.fromHttpUrl("https://www.alphavantage.co/query")
            .queryParam("function", "GLOBAL_QUOTE")
            .queryParam("symbol", symbol)
            .queryParam("apikey", apiKey)
            .toUriString()
        val response = restTemplate.getForObject(url, String::class.java) ?: return null
        logger.info("Alpha Vantage response for $symbol: $response")
        val json = JSONObject(response)
        val priceStr = json.optJSONObject("Global Quote")?.optString("05. price")
        if (priceStr.isNullOrBlank()) {
            logger.warn("No price found for symbol $symbol in Alpha Vantage response.")
            return null
        }
        return priceStr.toDoubleOrNull()
    }
}

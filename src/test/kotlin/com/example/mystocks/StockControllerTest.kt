package com.example.mystocks

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class StockControllerTest @Autowired constructor(
    val mockMvc: MockMvc
) {
    @Test
    fun `getStocks returns all stocks`() {
        val result = mockMvc.get("/getStocks")
            .andExpect { status { isOk() } }
            .andReturn()
        val content = result.response.contentAsString
        assertTrue(content.contains("AAPL"))
        assertTrue(content.contains("GOOGL"))
        assertTrue(content.contains("MSFT"))
        assertTrue(content.contains("AMZN"))
        assertTrue(content.contains("TSLA"))
    }

    @Test
    fun `getStock returns specific stock`() {
        val result = mockMvc.get("/getStock?symbol=GOOGL")
            .andExpect { status { isOk() } }
            .andReturn()
        val content = result.response.contentAsString
        assertTrue(content.contains("GOOGL"))
        assertFalse(content.contains("AAPL"))
    }

    @Test
    fun `getStock returns default stock when symbol not found`() {
        val result = mockMvc.get("/getStock?symbol=INVALID")
            .andExpect { status { isOk() } }
            .andReturn()
        val content = result.response.contentAsString
        assertTrue(content.contains("AAPL"))
    }
}


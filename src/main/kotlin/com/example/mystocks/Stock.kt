package com.example.mystocks

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

data class Stock(val symbol: String, val price: Double)

@Document(collection = "portfolio")
data class PortfolioEntry(
    @Id val id: String? = null,
    val symbol: String,
    val quantity: Int
)

data class PortfolioViewEntry(
    val id: String?,
    val symbol: String,
    val quantity: Int,
    val price: Double?
)

data class PortfolioDeleteRequest(val id: String? = null)

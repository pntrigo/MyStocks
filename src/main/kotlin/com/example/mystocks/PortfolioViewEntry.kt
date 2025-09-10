package com.example.mystocks

data class PortfolioViewEntry(
    val id: String?,
    val symbol: String,
    val quantity: Double,
    val price: Double?,
    val percentChangeToday: Double?,
    val peRatio: Double?
)


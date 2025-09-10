package com.example.mystocks

import org.springframework.data.mongodb.repository.MongoRepository

interface PortfolioRepository : MongoRepository<PortfolioEntry, String>


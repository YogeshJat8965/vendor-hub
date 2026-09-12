package com.marketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableMongoRepositories
@EnableScheduling
public class MarketplaceApplication {
    public static void main(String[] args) {
        // Log PORT environment variable for debugging Railway deployment
        String port = System.getenv("PORT");
        String serverPort = System.getProperty("server.port");
        System.out.println("========================================");
        System.out.println("RAILWAY DEPLOYMENT DEBUG");
        System.out.println("PORT env variable: " + port);
        System.out.println("server.port property: " + serverPort);
        System.out.println("========================================");
        
        SpringApplication.run(MarketplaceApplication.class, args);
    }
}

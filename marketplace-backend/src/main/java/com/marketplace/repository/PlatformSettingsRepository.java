package com.marketplace.repository;

import com.marketplace.model.PlatformSettings;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PlatformSettingsRepository extends MongoRepository<PlatformSettings, String> {
}

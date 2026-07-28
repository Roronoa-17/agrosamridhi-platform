package com.agrosamridhi.aiinference.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.agrosamridhi.aiinference.entity.SoilHealthRecord;

@Repository
public interface SoilHealthRecordRepository extends JpaRepository<SoilHealthRecord, Long>{
    
}

package com.agrosamridhi.aiinference.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.agrosamridhi.aiinference.entity.InferenceHistory;

@Repository
public interface InferenceHistoryRepository extends JpaRepository<InferenceHistory, Long>{

} 

package com.agrosamridhi.dataingestion.repository;

import com.agrosamridhi.dataingestion.entity.WeatherData;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WeatherRepository extends JpaRepository<WeatherData, Long> {
    List<WeatherData> findByDistrict(String district);
}
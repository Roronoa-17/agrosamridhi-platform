package com.agrosamridhi.dataingestion.repository;

import com.agrosamridhi.dataingestion.entity.WeatherData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WeatherRepository extends JpaRepository<WeatherData, Long> {

}
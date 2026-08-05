package com.agrosamridhi.dataingestion.repository;
import java.time.LocalDate;

import com.agrosamridhi.dataingestion.entity.MandiPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MandiRepository extends JpaRepository<MandiPrice, Long> {

    List<MandiPrice> findByCropNameContainingIgnoreCase(String cropName);

    List<MandiPrice> findByCropNameAndMandiNameAndArrivalDate(
            String cropName,
            String mandiName,
            LocalDate arrivalDate
    );

    List<MandiPrice> findByDistrictIgnoreCase(String district);

    List<MandiPrice> findByStateIgnoreCase(String state);

    List<MandiPrice> findByCropNameContainingIgnoreCaseAndDistrictIgnoreCase(String cropName, String district);

    List<MandiPrice> findByCropNameContainingIgnoreCaseAndStateIgnoreCase(String cropName, String state);
}
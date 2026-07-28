package com.agrosamridhi.dataingestion.repository;



import com.agrosamridhi.dataingestion.entity.MandiPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MandiRepository extends JpaRepository<MandiPrice, Long> {

}
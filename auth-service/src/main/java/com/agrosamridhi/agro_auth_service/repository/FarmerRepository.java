package com.agrosamridhi.agro_auth_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agrosamridhi.agro_auth_service.entity.Farmer;

public interface FarmerRepository extends JpaRepository<Farmer,Long> {
	Optional<Farmer> findByEmail(String email);
	boolean existsByEmail(String email);
	boolean existsByPhone(String phone);
}

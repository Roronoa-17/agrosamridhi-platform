package com.agrosamridhi.agro_auth_service.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="farmers", 
		indexes= {@Index(name="idx_farmer_email",
		columnList="email",unique=true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Farmer {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long farmerId;
	
	@Column(nullable=false,length=100)
	private String name;
	
	@Column(nullable=false,unique=true,length=150)
	private String email;
	
	@Column(nullable=false,length=15)
	private String phone;
	
	@Column(nullable=false)
	@JsonIgnore
	private String password;
	
	@Column(length=100)
	private String state;
	
	@Column(length=100)
	private String district;
	
	@Column(precision=10,scale=3)
	private BigDecimal landSizeAcres;

	private Long annualIncome;

	@Column(length=100)
	private String primaryCrop;
	
	@Enumerated(EnumType.STRING)
	@Column(length=10)
	private CasteCategory casteCategory;
	
	@Enumerated(EnumType.STRING)
	@Column(length=5)
	private Language preferredLanguage=Language.EN;
	
	private Double latitude;
	private Double longitude;
	
	@CreationTimestamp
	@Column(updatable=false)
	private LocalDateTime createAt;
	
	public enum CasteCategory{
		GEN,
		OBC,
		SC,
		ST,
		GENERAL
	}
	public enum Language{EN,HI,MR}
}

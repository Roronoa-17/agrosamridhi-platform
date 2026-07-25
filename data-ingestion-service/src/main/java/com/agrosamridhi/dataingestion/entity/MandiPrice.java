package com.agrosamridhi.dataingestion.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mandi_price")
public class MandiPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String cropName;

    @Column(nullable = false)
    private String mandiName;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private Double minPrice;

    @Column(nullable = false)
    private Double maxPrice;

    @Column(nullable = false)
    private Double modalPrice;

    @Column(nullable = false)
    private LocalDate arrivalDate;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public MandiPrice() {
    }

    public MandiPrice(Long id, String cropName, String mandiName,
                      String district, String state,
                      Double minPrice, Double maxPrice, Double modalPrice,
                      LocalDate arrivalDate, LocalDateTime createdAt) {
        this.id = id;
        this.cropName = cropName;
        this.mandiName = mandiName;
        this.district = district;
        this.state = state;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.modalPrice = modalPrice;
        this.arrivalDate = arrivalDate;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getMandiName() {
        return mandiName;
    }

    public void setMandiName(String mandiName) {
        this.mandiName = mandiName;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Double getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }

    public Double getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice;
    }

    public Double getModalPrice() {
        return modalPrice;
    }

    public void setModalPrice(Double modalPrice) {
        this.modalPrice = modalPrice;
    }

    public LocalDate getArrivalDate() {
        return arrivalDate;
    }

    public void setArrivalDate(LocalDate arrivalDate) {
        this.arrivalDate = arrivalDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
package com.agrosamridhi.aiinference.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class SoilHealthRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double nitrogen;
    private Double phosphorus;
    private Double potassium;
    private Double phLevel;
    private Double organicCarbon;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Double getNitrogen() {
        return nitrogen;
    }
    public void setNitrogen(Double nitrogen) {
        this.nitrogen = nitrogen;
    }
    public Double getPhosphorus() {
        return phosphorus;
    }
    public void setPhosphorus(Double phosphorus) {
        this.phosphorus = phosphorus;
    }
    public Double getPotassium() {
        return potassium;
    }
    public void setPotassium(Double potassium) {
        this.potassium = potassium;
    }
    public Double getPhLevel() {
        return phLevel;
    }
    public void setPhLevel(Double phLevel) {
        this.phLevel = phLevel;
    }
    public Double getOrganicCarbon() {
        return organicCarbon;
    }
    public void setOrganicCarbon(Double organicCarbon) {
        this.organicCarbon = organicCarbon;
    }
}

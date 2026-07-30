package com.agrosamridhi.dashboard_aggregator_service.dto;
import lombok.Data;

@Data
public class FarmerProfileDTO {
    private Long farmerId;
    private String name;
    private String state;
    private String district;
    private String primaryCrop;
    private String location; 
    
    // Manual getter just in case Lombok acts up again
    public String getLocation() { return location != null ? location : state; }
    public String getPrimaryCrop() { return primaryCrop; }
}
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
    
    // Weather is keyed by district, not state - prefer district, then explicit location, then state.
    public String getLocation() {
        if (district != null) return district;
        if (location != null) return location;
        return state;
    }
    public String getPrimaryCrop() { return primaryCrop; }
}
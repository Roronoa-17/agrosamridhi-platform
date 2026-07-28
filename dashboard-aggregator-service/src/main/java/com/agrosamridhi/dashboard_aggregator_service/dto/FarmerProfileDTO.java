package com.agrosamridhi.dashboard_aggregator_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FarmerProfileDTO implements Serializable {
    private String farmerId;
    private String fullName;
    private String location;
    private String primaryCrop;
	public String getFarmerId() {
		return farmerId;
	}
	public void setFarmerId(String farmerId) {
		this.farmerId = farmerId;
	}
	public String getFullName() {
		return fullName;
	}
	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public String getPrimaryCrop() {
		return primaryCrop;
	}
	public void setPrimaryCrop(String primaryCrop) {
		this.primaryCrop = primaryCrop;
	}
    
    
}
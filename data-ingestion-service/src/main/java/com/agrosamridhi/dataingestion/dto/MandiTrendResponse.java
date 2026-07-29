package com.agrosamridhi.dataingestion.dto;

public class MandiTrendResponse {

    private String cropName;
    private Double averagePrice;
    private Double minimumPrice;
    private Double maximumPrice;
    private Long totalRecords;

    public MandiTrendResponse() {
    }

    public MandiTrendResponse(String cropName,
                              Double averagePrice,
                              Double minimumPrice,
                              Double maximumPrice,
                              Long totalRecords) {
        this.cropName = cropName;
        this.averagePrice = averagePrice;
        this.minimumPrice = minimumPrice;
        this.maximumPrice = maximumPrice;
        this.totalRecords = totalRecords;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public Double getAveragePrice() {
        return averagePrice;
    }

    public void setAveragePrice(Double averagePrice) {
        this.averagePrice = averagePrice;
    }

    public Double getMinimumPrice() {
        return minimumPrice;
    }

    public void setMinimumPrice(Double minimumPrice) {
        this.minimumPrice = minimumPrice;
    }

    public Double getMaximumPrice() {
        return maximumPrice;
    }

    public void setMaximumPrice(Double maximumPrice) {
        this.maximumPrice = maximumPrice;
    }

    public Long getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(Long totalRecords) {
        this.totalRecords = totalRecords;
    }
}
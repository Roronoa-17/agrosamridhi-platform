package com.agrosamridhi.dataingestion.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AgmarknetRecord {

    private String state;

    private String district;

    @JsonProperty("market")
    private String market;

    @JsonProperty("commodity")
    private String commodity;

    @JsonProperty("variety")
    private String variety;

    @JsonProperty("grade")
    private String grade;

    @JsonProperty("arrival_date")
    private String arrivalDate;

    @JsonProperty("min_price")
    private Double minPrice;

    @JsonProperty("max_price")
    private Double maxPrice;

    @JsonProperty("modal_price")
    private Double modalPrice;

    public AgmarknetRecord() {
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getMarket() {
        return market;
    }

    public void setMarket(String market) {
        this.market = market;
    }

    public String getCommodity() {
        return commodity;
    }

    public void setCommodity(String commodity) {
        this.commodity = commodity;
    }

    public String getVariety() {
        return variety;
    }

    public void setVariety(String variety) {
        this.variety = variety;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getArrivalDate() {
        return arrivalDate;
    }

    public void setArrivalDate(String arrivalDate) {
        this.arrivalDate = arrivalDate;
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
}
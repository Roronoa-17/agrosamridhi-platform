package com.agrosamridhi.dataingestion.dto;

import java.util.List;

public class AgmarknetResponse {

    private List<AgmarknetRecord> records;

    public AgmarknetResponse() {
    }

    public List<AgmarknetRecord> getRecords() {
        return records;
    }

    public void setRecords(List<AgmarknetRecord> records) {
        this.records = records;
    }
}
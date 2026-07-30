package com.agrosamridhi.dataingestion.dto;

import java.util.List;

public class GeocodingResponse {

    private List<Result> results;

    public List<Result> getResults() {
        return results;
    }

    public void setResults(List<Result> results) {
        this.results = results;
    }

    public static class Result {

        private String name;
        private Double latitude;
        private Double longitude;
        private String country;
        private String admin1;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }

        public String getAdmin1() {
            return admin1;
        }

        public void setAdmin1(String admin1) {
            this.admin1 = admin1;
        }
    }
}

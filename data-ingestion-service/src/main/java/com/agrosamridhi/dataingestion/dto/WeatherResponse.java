package com.agrosamridhi.dataingestion.dto;

public class WeatherResponse {

    private Current current;

    public Current getCurrent() {
        return current;
    }

    public void setCurrent(Current current) {
        this.current = current;
    }

  public static class Current {

    private Double temperature_2m;
    private Integer relative_humidity_2m;
    private Double precipitation;
    private Double wind_speed_10m;

    public Double getTemperature_2m() {
        return temperature_2m;
    }

    public void setTemperature_2m(Double temperature_2m) {
        this.temperature_2m = temperature_2m;
    }

    public Integer getRelative_humidity_2m() {
        return relative_humidity_2m;
    }

    public void setRelative_humidity_2m(Integer relative_humidity_2m) {
        this.relative_humidity_2m = relative_humidity_2m;
    }

    public Double getPrecipitation() {
        return precipitation;
    }

    public void setPrecipitation(Double precipitation) {
        this.precipitation = precipitation;
    }

    public Double getWind_speed_10m() {
        return wind_speed_10m;
    }

    public void setWind_speed_10m(Double wind_speed_10m) {
        this.wind_speed_10m = wind_speed_10m;
    }
}
}
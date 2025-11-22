package edu.sbu.cse416.app.util;

import java.util.HashMap;
import java.util.Map;

public class FipsUtil {

    private static final Map<String, String> STATE_FIPS_MAP = new HashMap<>();

    static {
        STATE_FIPS_MAP.put("01", "ALABAMA");
        STATE_FIPS_MAP.put("02", "ALASKA");
        STATE_FIPS_MAP.put("04", "ARIZONA");
        STATE_FIPS_MAP.put("05", "ARKANSAS");
        STATE_FIPS_MAP.put("06", "CALIFORNIA");
        STATE_FIPS_MAP.put("08", "COLORADO");
        STATE_FIPS_MAP.put("09", "CONNECTICUT");
        STATE_FIPS_MAP.put("10", "DELAWARE");
        STATE_FIPS_MAP.put("11", "DISTRICT OF COLUMBIA");
        STATE_FIPS_MAP.put("12", "FLORIDA");
        STATE_FIPS_MAP.put("13", "GEORGIA");
        STATE_FIPS_MAP.put("15", "HAWAII");
        STATE_FIPS_MAP.put("16", "IDAHO");
        STATE_FIPS_MAP.put("17", "ILLINOIS");
        STATE_FIPS_MAP.put("18", "INDIANA");
        STATE_FIPS_MAP.put("19", "IOWA");
        STATE_FIPS_MAP.put("20", "KANSAS");
        STATE_FIPS_MAP.put("21", "KENTUCKY");
        STATE_FIPS_MAP.put("22", "LOUISIANA");
        STATE_FIPS_MAP.put("23", "MAINE");
        STATE_FIPS_MAP.put("24", "MARYLAND");
        STATE_FIPS_MAP.put("25", "MASSACHUSETTS");
        STATE_FIPS_MAP.put("26", "MICHIGAN");
        STATE_FIPS_MAP.put("27", "MINNESOTA");
        STATE_FIPS_MAP.put("28", "MISSISSIPPI");
        STATE_FIPS_MAP.put("29", "MISSOURI");
        STATE_FIPS_MAP.put("30", "MONTANA");
        STATE_FIPS_MAP.put("31", "NEBRASKA");
        STATE_FIPS_MAP.put("32", "NEVADA");
        STATE_FIPS_MAP.put("33", "NEW HAMPSHIRE");
        STATE_FIPS_MAP.put("34", "NEW JERSEY");
        STATE_FIPS_MAP.put("35", "NEW MEXICO");
        STATE_FIPS_MAP.put("36", "NEW YORK");
        STATE_FIPS_MAP.put("37", "NORTH CAROLINA");
        STATE_FIPS_MAP.put("38", "NORTH DAKOTA");
        STATE_FIPS_MAP.put("39", "OHIO");
        STATE_FIPS_MAP.put("40", "OKLAHOMA");
        STATE_FIPS_MAP.put("41", "OREGON");
        STATE_FIPS_MAP.put("42", "PENNSYLVANIA");
        STATE_FIPS_MAP.put("44", "RHODE ISLAND");
        STATE_FIPS_MAP.put("45", "SOUTH CAROLINA");
        STATE_FIPS_MAP.put("46", "SOUTH DAKOTA");
        STATE_FIPS_MAP.put("47", "TENNESSEE");
        STATE_FIPS_MAP.put("48", "TEXAS");
        STATE_FIPS_MAP.put("49", "UTAH");
        STATE_FIPS_MAP.put("50", "VERMONT");
        STATE_FIPS_MAP.put("51", "VIRGINIA");
        STATE_FIPS_MAP.put("53", "WASHINGTON");
        STATE_FIPS_MAP.put("54", "WEST VIRGINIA");
        STATE_FIPS_MAP.put("55", "WISCONSIN");
        STATE_FIPS_MAP.put("56", "WYOMING");
        STATE_FIPS_MAP.put("60", "AMERICAN SAMOA");
        STATE_FIPS_MAP.put("66", "GUAM");
        STATE_FIPS_MAP.put("69", "NORTHERN MARIANA ISLANDS");
        STATE_FIPS_MAP.put("72", "PUERTO RICO");
        STATE_FIPS_MAP.put("78", "U.S. VIRGIN ISLANDS");
    }

    public static String getStateName(String fipsPrefix) {
        if (fipsPrefix == null || fipsPrefix.length() < 2) {
            return null;
        }
        String stateFips = fipsPrefix.substring(0, 2);
        return STATE_FIPS_MAP.get(stateFips);
    }
}

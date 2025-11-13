package edu.sbu.cse416.app.dto;

import java.util.Map;

/**
 * DTO representing one row of provisional ballot table data.
 */
public record ProvisionalTableData(
        String jurisdictionName,
        Integer totalProv,
        Integer provCountFullyCounted,
        Integer provCountPartialCounted,
        Integer provRejected,
        Integer provisionalOtherStatus) {
}

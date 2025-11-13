package edu.sbu.cse416.app.util;

import java.lang.reflect.Constructor;
import java.lang.reflect.RecordComponent;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

/**
 * Generic utility for aggregating Integer fields from record classes.
 * Automatically sums all Integer fields across multiple records and creates a new response record.
 */
public class RecordAggregator {

    /**
     * Aggregates a list of source records into a single response record by summing Integer fields.
     *
     * @param <T> Source record type (e.g., ProvisionalBallots)
     * @param <R> Response record type (e.g., ProvisionalChartResponse)
     * @param data List of source data records
     * @param extractor Function to extract the nested record from the parent object
     * @param responseClass The class of the response DTO to create
     * @return Aggregated response record with all Integer fields summed
     */
    public static <T, R extends Record> R aggregate(
            List<T> data, Function<T, ? extends Record> extractor, Class<R> responseClass) {

        // Get the canonical constructor and record components
        RecordComponent[] components = responseClass.getRecordComponents();
        Constructor<R> constructor;

        try {
            Class<?>[] paramTypes =
                    Arrays.stream(components).map(RecordComponent::getType).toArray(Class<?>[]::new);
            constructor = responseClass.getDeclaredConstructor(paramTypes);
        } catch (NoSuchMethodException e) {
            throw new IllegalArgumentException("Cannot find canonical constructor for " + responseClass.getName(), e);
        }

        // Initialize accumulator array with zeros
        Object[] accumulator = new Object[components.length];
        for (int i = 0; i < components.length; i++) {
            Class<?> type = components[i].getType();
            if (type == Integer.class) {
                accumulator[i] = 0;
            } else if (type == Long.class) {
                accumulator[i] = 0L;
            } else if (type == Double.class) {
                accumulator[i] = 0.0;
            } else {
                throw new IllegalArgumentException("Unsupported field type: " + type.getName());
            }
        }

        // Aggregate data
        for (T item : data) {
            Record sourceRecord = extractor.apply(item);
            if (sourceRecord == null) continue;

            RecordComponent[] sourceComponents = sourceRecord.getClass().getRecordComponents();

            for (int i = 0; i < components.length; i++) {
                String fieldName = components[i].getName();
                Class<?> fieldType = components[i].getType();

                // Find matching field in source record
                RecordComponent sourceComponent = Arrays.stream(sourceComponents)
                        .filter(rc -> rc.getName().equals(fieldName))
                        .findFirst()
                        .orElse(null);

                if (sourceComponent != null) {
                    try {
                        Object value = sourceComponent.getAccessor().invoke(sourceRecord);
                        if (value != null) {
                            accumulator[i] = addValues(accumulator[i], value, fieldType);
                        }
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to access field: " + fieldName, e);
                    }
                }
            }
        }

        // Create response record
        try {
            return constructor.newInstance(accumulator);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create response record", e);
        }
    }

    private static Object addValues(Object accumulator, Object value, Class<?> type) {
        if (type == Integer.class && value instanceof Integer) {
            return ((Integer) accumulator) + ((Integer) value);
        } else if (type == Long.class && value instanceof Long) {
            return ((Long) accumulator) + ((Long) value);
        } else if (type == Double.class && value instanceof Double) {
            return ((Double) accumulator) + ((Double) value);
        }
        return accumulator;
    }
}

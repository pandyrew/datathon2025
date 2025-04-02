WITH 
-- Total count
total_count AS (
  SELECT COUNT(*) as count FROM participant_applications
),

-- Status counts
status_counts AS (
  SELECT 
    status, 
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT count FROM total_count), 1) as percentage
  FROM participant_applications
  GROUP BY status
),

-- Masters program counts
masters_counts AS (
  SELECT 
    COUNT(*) FILTER (WHERE masters_program IS NOT NULL) as with_masters,
    COUNT(*) FILTER (WHERE masters_program IS NULL) as without_masters,
    ROUND(COUNT(*) FILTER (WHERE masters_program IS NOT NULL) * 100.0 / (SELECT count FROM total_count), 1) as masters_percentage
  FROM participant_applications
),

-- Masters program breakdown
masters_breakdown AS (
  SELECT 
    masters_program, 
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT with_masters FROM masters_counts), 1) as program_percentage
  FROM participant_applications
  WHERE masters_program IS NOT NULL
  GROUP BY masters_program
),

-- Education level counts
education_counts AS (
  SELECT 
    education_level, 
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT count FROM total_count), 1) as percentage
  FROM participant_applications
  GROUP BY education_level
),

-- Applications with complete ratings
rated_applications AS (
  SELECT 
    COUNT(DISTINCT pa.id) as count,
    ROUND(COUNT(DISTINCT pa.id) * 100.0 / (SELECT count FROM total_count), 1) as percentage
  FROM participant_applications pa
  INNER JOIN ratings r ON pa.id = r.application_id
)

-- Final output
SELECT 
  'Total Applications' as category,
  (SELECT count FROM total_count) as value,
  NULL as percentage
UNION ALL
SELECT 
  'Applications Rated', 
  (SELECT count FROM rated_applications),
  (SELECT percentage FROM rated_applications)
UNION ALL
SELECT 
  'Applications Not Rated', 
  (SELECT count FROM total_count) - (SELECT count FROM rated_applications),
  100 - (SELECT percentage FROM rated_applications)
UNION ALL
SELECT 
  '---STATUS BREAKDOWN---' as category, 
  NULL as value, 
  NULL as percentage
UNION ALL
SELECT 
  status || ' Applications' as category, 
  count as value, 
  percentage
FROM status_counts
UNION ALL
SELECT 
  '---MASTERS PROGRAM---' as category, 
  NULL as value, 
  NULL as percentage
UNION ALL
SELECT 
  'Masters Program Applications', 
  with_masters,
  masters_percentage
FROM masters_counts
UNION ALL
SELECT 
  'Regular Applications', 
  without_masters,
  100 - masters_percentage
FROM masters_counts
UNION ALL
SELECT 
  '---MASTERS PROGRAM BREAKDOWN---' as category, 
  NULL as value, 
  NULL as percentage
UNION ALL
SELECT 
  masters_program || ' Program' as category, 
  count as value, 
  program_percentage
FROM masters_breakdown
UNION ALL
SELECT 
  '---EDUCATION LEVEL---' as category, 
  NULL as value, 
  NULL as percentage
UNION ALL
SELECT 
  'Education Level: ' || education_level as category, 
  count as value, 
  percentage
FROM education_counts
ORDER BY category; 
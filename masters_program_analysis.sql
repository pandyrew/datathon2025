-- Masters Program Analysis

-- Count of applications by masters program
SELECT 
  masters_program, 
  COUNT(*) as application_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM participant_applications WHERE masters_program IS NOT NULL), 1) as percentage_of_masters
FROM participant_applications
WHERE masters_program IS NOT NULL
GROUP BY masters_program
ORDER BY application_count DESC;

-- Status breakdown by masters program
SELECT 
  masters_program,
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY masters_program), 1) as percentage
FROM participant_applications
WHERE masters_program IS NOT NULL
GROUP BY masters_program, status
ORDER BY masters_program, status;

-- Average rating by masters program
SELECT 
  pa.masters_program,
  COUNT(DISTINCT pa.id) as application_count,
  COUNT(DISTINCT r.id) as rated_applications,
  ROUND(AVG(r.score), 2) as average_rating,
  MIN(r.score) as min_rating,
  MAX(r.score) as max_rating
FROM participant_applications pa
LEFT JOIN ratings r ON pa.id = r.application_id
WHERE pa.masters_program IS NOT NULL
GROUP BY pa.masters_program
ORDER BY average_rating DESC NULLS LAST;

-- Technical comfort level distribution by masters program
SELECT 
  masters_program,
  comfort_level,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY masters_program), 1) as percentage
FROM participant_applications
WHERE masters_program IS NOT NULL AND comfort_level IS NOT NULL
GROUP BY masters_program, comfort_level
ORDER BY masters_program, comfort_level;

-- First datathon distribution by masters program
SELECT 
  masters_program,
  CASE WHEN is_first_datathon THEN 'Yes' ELSE 'No' END as first_datathon,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY masters_program), 1) as percentage
FROM participant_applications
WHERE masters_program IS NOT NULL
GROUP BY masters_program, is_first_datathon
ORDER BY masters_program, is_first_datathon DESC; 
-- Basic counts
SELECT 'Total Participant Applications' as metric, COUNT(*) as count 
FROM participant_applications;

-- Count by application status
SELECT 
  'Applications by Status' as category,
  status as metric, 
  COUNT(*) as count 
FROM participant_applications
GROUP BY status
ORDER BY count DESC;

-- Count masters program applications
SELECT 
  'Masters Program Applications' as category,
  COALESCE(masters_program, 'None') as metric, 
  COUNT(*) as count 
FROM participant_applications
WHERE masters_program IS NOT NULL 
GROUP BY masters_program
ORDER BY count DESC;

-- Count by education level
SELECT 
  'Education Level' as category,
  education_level as metric, 
  COUNT(*) as count 
FROM participant_applications
GROUP BY education_level
ORDER BY count DESC;

-- Count by technical comfort level
SELECT 
  'Technical Comfort Level' as category,
  comfort_level as metric, 
  COUNT(*) as count 
FROM participant_applications
GROUP BY comfort_level
ORDER BY count DESC;

-- Count by first datathon
SELECT 
  'First Datathon' as category,
  CASE WHEN is_first_datathon = true THEN 'Yes' ELSE 'No' END as metric, 
  COUNT(*) as count 
FROM participant_applications
GROUP BY is_first_datathon
ORDER BY count DESC;

-- Count by has team
SELECT 
  'Has Team' as category,
  CASE WHEN has_team = true THEN 'Yes' ELSE 'No' END as metric, 
  COUNT(*) as count 
FROM participant_applications
GROUP BY has_team
ORDER BY count DESC; 
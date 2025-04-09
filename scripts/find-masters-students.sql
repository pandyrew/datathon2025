SELECT 
    s.id as student_id,
    s.first_name,
    s.last_name,
    s.email,
    pa.masters_program,
    pa.status as application_status,
    pa.created_at as application_date
FROM students s
JOIN participant_applications pa ON s.id = pa.student_id
WHERE pa.masters_program IS NOT NULL 
AND pa.masters_program != ''
AND pa.masters_program IN ('MSBA', 'MFin', 'MPAc', 'MIE')
ORDER BY pa.masters_program, s.last_name, s.first_name;

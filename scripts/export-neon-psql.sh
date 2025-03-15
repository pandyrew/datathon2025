#!/bin/bash

# Load environment variables from .env.neon
export $(grep -v '^#' .env.neon | xargs)

# Create csvs directory if it doesn't exist
mkdir -p csvs

# Export students
echo "Exporting students..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "COPY (SELECT * FROM students) TO STDOUT WITH CSV HEADER" > csvs/students.csv

# Export participant_applications
echo "Exporting participant_applications..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "COPY (SELECT * FROM participant_applications) TO STDOUT WITH CSV HEADER" > csvs/participant_applications.csv

# Export mentor_applications
echo "Exporting mentor_applications..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "COPY (SELECT * FROM mentor_applications) TO STDOUT WITH CSV HEADER" > csvs/mentor_applications.csv

# Export judge_applications
echo "Exporting judge_applications..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "COPY (SELECT * FROM judge_applications) TO STDOUT WITH CSV HEADER" > csvs/judge_applications.csv

# Export teams
echo "Exporting teams..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "COPY (SELECT * FROM teams) TO STDOUT WITH CSV HEADER" > csvs/teams.csv

# Export ratings
echo "Exporting ratings..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "COPY (SELECT * FROM ratings) TO STDOUT WITH CSV HEADER" > csvs/ratings.csv

echo "Export completed!" 
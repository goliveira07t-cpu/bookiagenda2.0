-- SQL to update a service
UPDATE services
SET name = 'New Service Name',
    duration = 60, -- duration in minutes
    price = 150.00
WHERE id = 'SERVICE_ID';

-- SQL to delete a service
DELETE FROM services
WHERE id = 'SERVICE_ID';
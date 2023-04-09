DROP TABLE IF EXISTS movietable ;
CREATE TABLE IF NOT EXISTS movietable
 
 (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    poster  VARCHAR(255),
   overview  VARCHAR(255),
   comment VARCHAR(255))
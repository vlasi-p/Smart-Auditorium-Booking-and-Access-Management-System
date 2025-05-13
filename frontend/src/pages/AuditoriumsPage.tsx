import { Container, Card, CardContent, Typography, Button, Grid } from '@mui/material';
import { useState, useEffect } from 'react';

type Auditorium = {
  id: number;
  name: string;
  status: 'available' | 'busy'; // Limiting to two possible statuses
};

const AuditoriumsPage = () => {
  const [auditoriums, setAuditoriums] = useState<Auditorium[]>([]);

  useEffect(() => {
    // Replace with actual API call for fetching auditoriums
    setAuditoriums([
      { id: 1, name: 'Auditorium A', status: 'available' },
      { id: 2, name: 'Auditorium B', status: 'busy' },
      { id: 3, name: 'Auditorium C', status: 'available' },
    ]);
  }, []);

  const handleReserve = (auditorium: Auditorium) => {
    // Replace alert with actual booking form handling
    alert(`Booking form for ${auditorium.name}`);
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Available Auditoriums
      </Typography>
      {/* Grid container here to wrap the items */}
      <Grid container spacing={3}>
        {/* {auditoriums.map((a) => (
          <Grid item xs={12} sm={6} md={4} key={a.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">{a.name}</Typography>
                <Typography>Status: {a.status}</Typography>
                {a.status === 'available' && (
                  <Button
                    sx={{ mt: 1 }}
                    variant="contained"
                    onClick={() => handleReserve(a)}
                  >
                    Reserve
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))} */}
      </Grid>
    </Container>
  );
};

export default AuditoriumsPage;

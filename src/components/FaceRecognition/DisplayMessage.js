import { Typography, Box } from "@mui/material";

const DisplayMessage = ({ visitorData, isClockIn }) => {
  if (!visitorData || !visitorData.attendance) return null; // Ensure visitorData and attendance exist

  // Prepare the message based on the type of check-in or check-out
  const checkInMessage = `Check-In Successful, Hello ${visitorData.fullName}, Welcome to Room 1`;
  const checkOutMessage = `Check-Out Successful, See you next time ${visitorData.fullName} !`;

  const message = isClockIn ? checkInMessage : checkOutMessage;

  return (
    <Box sx={{ mt: 3, textAlign: "center" }}>
      <Typography variant="h6" sx={{ color: isClockIn ? "green" : "blue" }}>
        {message}
      </Typography>
      <Typography variant="body1">
        <strong>Full Name:</strong> {visitorData.fullName}
      </Typography>
      <Typography variant="body1">
        <strong>NIK:</strong> {visitorData.nik}
      </Typography>
      <Typography variant="body1">
        <strong>Company:</strong> {visitorData.companyName}
      </Typography>
      <Typography variant="body1">
        <strong>Check-In Time:</strong> {new Date(visitorData.attendance.check_in).toLocaleString()}
      </Typography>
      {visitorData.attendance.check_out && (
        <Typography variant="body1">
          <strong>Check-Out Time:</strong> {new Date(visitorData.attendance.check_out).toLocaleString()}
        </Typography>
      )}
    </Box>
  );
};

export default DisplayMessage;

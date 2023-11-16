// used to get end property to use in event of react-big-calendar. Used in Appointment Scheduler
export const addToDate = (date, hours) => {
    const newDate = new Date(date);
    newDate.setHours(date.getHours() + hours);
    return newDate;
};

// used to get all possible hour frames from 7 AM to 10PM (ends at 10 so final start is at 9). Used in TutorScheduler
export const generateAllPossibleTimeSlots = (startDate, endDate) => {
  const timeSlots = [];
  let currentTime = new Date(startDate);
  currentTime.setHours(7, 0, 0, 0);

  const endTime = new Date(endDate);
  endTime.setHours(22, 0, 0, 0);

  while (currentTime <= endTime) {
    // currentTime between 7 AM and 9 PM. this is start time
    if (currentTime.getHours() >= 7 && currentTime.getHours() <= 21) {
      timeSlots.push(new Date(currentTime));
    }
    currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // increment by 1 hour
  }
  return timeSlots;
};

// filter out the unavailable time slots. Used in TutorScheduler.
export const calculateAvailableTimeSlots = (allPossibleTimeSlots, tutorTimeSlots) => {
  const bookedTimeSlots = new Set(tutorTimeSlots.map((slot) => new Date(slot.timestamp).getTime()));
  const availableSlots = allPossibleTimeSlots.filter(
    (slot) => !bookedTimeSlots.has(new Date(slot).getTime())
  );
  return availableSlots;
};



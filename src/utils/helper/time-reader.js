import moment from "moment";

function readTime(durationStr) {
  const duration = moment.duration(durationStr);

  const hours = duration.hours();
  const minutes = duration.minutes();

  let formattedTime = "";
  if (hours > 0) {
    formattedTime += `${hours} jam`;
  }
  if (minutes > 0) {
    if (hours > 0) {
      formattedTime += " ";
    }
    formattedTime += `${minutes} menit`;
  }

  return formattedTime;
}

export { readTime };

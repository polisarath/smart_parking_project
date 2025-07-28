import { getBookings } from "@/actions/actions";
import Timeline from "@/components/timeline";
import TimelineTicks from "@/components/timeline-ticks";
import { blockLength, blockPostion, sortcomparer } from "@/lib/utils";
import { Booking } from "@/schemas/booking";
import { BookingStatus } from "@/types";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";


function Booked({ date, locationid }: { date: Date; locationid: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // const result = await getBookings(date, locationid, BookingStatus.BOOKED)

  useEffect(() => {
    if (locationid && date) {

      (async () => {
        setLoading(true)

       // const result = await getBookings(startOfDay(date), locationid, BookingStatus.BOOKED)
         const result = await getBookings(date, locationid, BookingStatus.BOOKED)
        console.log("getBookings result:", result);
        setBookings(result.data as Booking[])
        setLoading(false)
      })()
    }
  }, [date, locationid])


  function convertToCSV(data: Booking[]) {
    const headers = [
      "User",
      "Plate",
      "Start Time",
      "End Time",
      "Duration (mins)",
    ];
    const rows = data.map((booking) => {
      const duration = Math.round(
        (new Date(booking.endtime).getTime() -
          new Date(booking.starttime).getTime()) /
          60000
      );
      return [
        booking.userid ?? "N/A",
        booking.plate ?? "N/A",
        format(new Date(booking.starttime), "HH:mm"),
        format(new Date(booking.endtime), "HH:mm"),
        duration.toString(),
      ];
    });

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  function downloadCSV(data: Booking[]) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bookings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : // bookings.length > 0 ?
      // <div className='relative h-full p-2 bg-white rounded-md shadow overflow-x-auto'>
      //     <Timeline />
      //     <TimelineTicks />
      //     <div className='relative' style={{ height: `${bookings.length * 60}px`}}>
      //       {
      //         bookings.sort(sortcomparer).map((booking, index) => (
      //           <div key={index}
      //             style={{
      //               width: `${blockLength(booking.starttime, booking.endtime)}px`,
      //               left: `${blockPostion(booking.starttime)}px`,
      //               top: `${(index + 1) * 36}px`
      //             }}
      //             className='h-8 bg-blue-500 text-white absolute rounded-md'
      //           >
      //             <p className='text-sm p-1 overflow-hidden overflow-ellipsis whitespace-nowrap'>
      //             {format(booking.starttime, 'HH:mm')}-{format(booking.endtime, 'HH:mm')}
      //             </p>

      //           </div>
      //         ))
      //       }
      //     </div>
      // </div>

      // :
      // <p className="text-center pt-12 pb-12 text-xl sm:text-4xl text-slate-300">No bookings</p>
      bookings.length > 0 ? (
        <>
          <div className="relative h-full p-2 bg-white rounded-md shadow overflow-x-auto">
            <Timeline />
            <TimelineTicks />
            <div
              className="relative"
              style={{ height: `${bookings.length * 60}px` }}
            >
              {bookings.sort(sortcomparer).map((booking, index) => (
                <div
                  key={index}
                  style={{
                    width: `${blockLength(
                      booking.starttime,
                      booking.endtime
                    )}px`,
                    left: `${blockPostion(booking.starttime)}px`,
                    top: `${(index + 1) * 36}px`,
                  }}
                  className="h-8 bg-blue-500 text-white absolute rounded-md"
                >
                  <p className="text-sm p-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {format(booking.starttime, "HH:mm")} -{" "}
                    {format(booking.endtime, "HH:mm")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-white rounded-md shadow p-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Booking Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-2 border">User</th>
                    <th className="p-2 border">Vehicle</th>
                    <th className="p-2 border">Start Time</th>
                    <th className="p-2 border">End Time</th>
                    <th className="p-2 border">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2 border">
                        {booking.userid || booking.userid || "N/A"}
                      </td>
                      {/* <td className="p-2 border">{booking.userName || 'N/A'}</td>
<td className="p-2 border">{booking.userEmail || 'N/A'}</td> */}

                      <td className="p-2 border">{booking.plate || "N/A"}</td>

                      <td className="p-2 border">
                        {format(booking.starttime, "HH:mm")}
                      </td>
                      <td className="p-2 border">
                        {format(booking.endtime, "HH:mm")}
                      </td>
                      <td className="p-2 border">
                        {Math.round(
                          (new Date(booking.endtime).getTime() -
                            new Date(booking.starttime).getTime()) /
                            60000
                        )}{" "}
                        mins
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center pt-12 pb-12 text-xl sm:text-4xl text-slate-300">
          No bookings
        </p>
      )}
      <div className="flex justify-end mt-2">
        <button
          onClick={() => downloadCSV(bookings)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Export as CSV
        </button>
      </div>
    </>
  );
}

export default Booked;


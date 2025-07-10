"use client"

export default function AnimatedCrossBanner() {
  const text1 = "Obat palsu? Skip, bro!"
  const text2 = "Cek dulu, baru telan!"
  const text3 = "Minum obat, bukan minum risiko!"
  const separator = " • "
  const fullText = Array(8)
    .fill(text1 + separator + text2 + separator + text3)
    .join(" ")

  return (
    <div className="w-full h-24 lg:mt-0 mt-10 bg-white flex items-center justify-center relative z-20">
      {/* First diagonal stripe - top-left to bottom-right */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full lg:h-[90px] h-14">
          {/* Background stripe */}
          <div
            className="absolute inset-0 bg-white border-2 border-gray-200 transform -rotate-[1deg] origin-center shadow-xl"
            style={{
              width: "150%",
              left: "-25%",
            }}
          />

          {/* Text container */}
          {/* <div className="absolute inset-0 flex items-center overflow-hidden transform -rotate-[3deg]">
            <div className="flex animate-scroll-right-continuous">
              <span className="text-white font-bold text-3xl whitespace-nowrap">
                {fullText}
              </span>
              <span className="text-white font-bold text-3xl whitespace-nowrap">
                {fullText}
              </span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Second diagonal stripe - top-right to bottom-left */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full lg:h-[90px] h-14">
          {/* Background stripe */}
          <div
            className="absolute inset-0 bg-teal-600 transform rotate-[3deg] origin-center shadow-lg"
            style={{
              width: "150%",
              left: "-25%",
            }}
          />

          {/* Text container */}
          <div className="absolute inset-0 flex items-center overflow-hidden transform rotate-[3deg]">
            <div className="flex animate-scroll-left-continuous">
              <span className="text-white font-bold lg:text-3xl text-2xl whitespace-nowrap">
                {fullText}
              </span>
              <span className="text-white font-bold lg:text-3xl text-2xl whitespace-nowrap">
                {fullText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-right-continuous {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scroll-left-continuous {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-scroll-right-continuous {
          animation: scroll-right-continuous 50s linear infinite;
        }
        
        .animate-scroll-left-continuous {
          animation: scroll-left-continuous 50s linear infinite;
        }
      `}</style>
    </div>
  )
}

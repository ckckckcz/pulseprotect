export default function TeamSection() {
  const teamMembers = [
    {
      name: "Gabriel Batavia",
      title: "AI Engineer",
      image: "/placeholder.svg?height=320&width=280",
    },
    {
      name: "Sophie Bennett",
      title: "Lead UI/UX Designer",
      image: "/placeholder.svg?height=320&width=280",
    },
    {
      name: "Riovaldo Alfiyan Fahmi Rahman",
      title: "Fullstack Web Developer",
      image: "/placeholder.svg?height=320&width=280",
    },
  ]

  return (
    <section className="bg-white py-24 px-8 lg:px-24 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex lg:h-[440px]">
            <h1 className="text-black font-bold text-5xl leading-tight text-left">
              <span>
                The <span className="italic text-teal-700">Minds</span> 
              </span>
              <span>
                <div className="bg-white border-l-2 lg:block hidden border-gray-200 border-dashed ml-1 w-full h-full"></div>
              </span>
              <br className="block lg:hidden" />
              <span>
                Behind The <span className="italic text-teal-700">Magic</span> 
              </span>
            </h1>
          </div>

          {/* Right Column - Team Grid */}
          <div className="flex-[2] w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl shadow-md h-[260px] group bg-gray-100">
                  {/* Team Member Image */}
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={`${member.name}, ${member.title}`}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Gradient Overlay with Text */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 py-3">
                    <h3 className="text-black font-semibold text-base">{member.name}</h3>
                    <p className="text-black text-sm opacity-80">{member.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
            

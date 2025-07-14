export default function TeamSection() {
  const teamMembers = [
    {
      name: "Ethan Carter",
      title: "Founder & Creative Director",
      image: "/placeholder.svg?height=320&width=280",
    },
    {
      name: "Sophie Bennett",
      title: "Lead UI/UX Designer",
      image: "/placeholder.svg?height=320&width=280",
    },
    {
      name: "Liam Foster",
      title: "Head of Web Development",
      image: "/placeholder.svg?height=320&width=280",
    },
    {
      name: "Olivia Hayes",
      title: "Marketing & Brand Strategist",
      image: "/placeholder.svg?height=320&width=280",
    },
    {
      name: "Noah Reed",
      title: "Visual & Motion Designer",
      image: "/placeholder.svg?height=320&width=280",
    },
    {
      name: "Emma Collins",
      title: "Client Success Manager",
      image: "/placeholder.svg?height=320&width=280",
    },
  ]

  return (
    <section className="bg-black py-24 px-8 lg:px-24 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Left Column - Heading */}
          <div className="mb-12 lg:mb-0">
            <h1 className="text-white font-bold text-4xl lg:text-5xl leading-tight">
              <span className="block">The minds</span>
              <span className="block">behind the magic</span>
            </h1>
          </div>

          {/* Right Column - Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg shadow-md h-[320px] group">
                {/* Team Member Image */}
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={`${member.name}, ${member.title}`}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />

                {/* Gradient Overlay with Text */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 py-3">
                  <h3 className="text-white font-semibold text-base">{member.name}</h3>
                  <p className="text-white text-sm opacity-80">{member.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

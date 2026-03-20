export default function StoriesRow() {
  const stories = [
    { id: 1, name: 'New Lessons', img: 'https://images.unsplash.com/photo-1549834125-82d3c48159a3?w=150&q=80', active: true },
    { id: 2, name: 'Top Pro', img: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=150&q=80', active: true },
    { id: 3, name: 'Guitar 101', img: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=150&q=80', active: false },
    { id: 4, name: 'Beat Theory', img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150&q=80', active: false },
    { id: 5, name: 'Vocals', img: 'https://images.unsplash.com/photo-1516280440502-6cfae259e8f4?w=150&q=80', active: false },
  ];

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-2 pt-4">
      <div className="flex gap-4 px-4 min-w-max">
        {stories.map(story => (
          <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className={`w-16 h-16 rounded-full p-[2px] ${story.active ? 'bg-gradient-to-tr from-[#f6339a] via-[#f6339a] to-[#0e9eef]' : 'bg-[#2a2a35]'} shadow-lg group-hover:scale-105 transition-transform`}>
              <div className="w-full h-full bg-[#121216] rounded-full overflow-hidden border-[3px] border-[#121216]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className={`text-[11px] font-medium tracking-wide ${story.active ? 'text-white' : 'text-gray-400'}`}>
              {story.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

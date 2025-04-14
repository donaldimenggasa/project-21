import Link from "next/link";
import Image from 'next/image'
import PostItem from "@/components/post-item";

export default function SpecialOffers({ posts  = [] } : any) {
  return (
    
     <section>
     <div className="max-w-6xl mx-auto px-4 sm:px-6">
       <div className="pb-12 md:pb-20">
         <div className="lg:flex lg:justify-between">
           {/* Main content */}
           <div
             className="lg:grow"
             data-aos="fade-down"
             data-aos-delay="200"
           >
             {/* Section title */}
             <h4 className="h3 font-red-hat-display mb-8">Latest</h4>

             {/* Articles container */}
             <div className="grid gap-12 sm:grid-cols-2 sm:gap-x-6 md:gap-y-8 items-start">
               {posts.map((post : any, postIndex : number) => (
                 <PostItem key={postIndex} {...post} />
               ))}
             </div>

             {/* Load more button */}
             <div className="flex justify-center mt-12 md:mt-16">
               <a
                 className="btn-sm text-gray-300 hover:text-gray-100 bg-gray-800 flex items-center"
                 href="#0"
               >
                 <span>See previous articles</span>
                 <svg
                   className="w-4 h-4 shrink-0 ml-3"
                   viewBox="0 0 16 16"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <path
                     className="fill-current text-gray-500"
                     d="M14.7 9.3l-1.4-1.4L9 12.2V0H7v12.2L2.7 7.9 1.3 9.3 8 16z"
                   />
                 </svg>
               </a>
             </div>
           </div>
         </div>
       </div>
     </div>
   </section>
  )
}
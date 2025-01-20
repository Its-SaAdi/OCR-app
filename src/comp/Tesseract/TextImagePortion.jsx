import React from 'react'

const TextImagePortion = ({data, image}) => {
    const imageURL = URL.createObjectURL(image);

  return (
    <article className='p-3 my-6 flex justify-center items-center gap-4 bg-zinc-800 rounded-3xl'>
        <figure className='max-w-[400px] min-w-[300px] h-auto rounded-2xl overflow-hidden'>
            <img 
                src={imageURL} 
                alt="Target Image"
                width={300}
                height='auto' 
            />
        </figure>

        <article className='p-4 rounded-2xl mb-1 border-dashed border-zinc-300 border-2 w-2/3 text-left'>
            <h2 className='mb-4 font-bold text-zinc-400 italic'>Text from {image.name}:</h2>
            {
                data.map((line, index) => (
                    <p key={index}>
                        {line.text}
                    </p>
                ))
            }
        </article>
    </article>
  )
}

export default TextImagePortion
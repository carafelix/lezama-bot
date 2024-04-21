export function formatPoems(poem: PoemDocument, chunk?: number) {
    return (
`${poem.title}

${poem.text}

        ${poem.book.author} — ${poem.book.title} ${poem.book.publishYear ? `(${poem.book.publishYear})` : ''}
`
    )
}
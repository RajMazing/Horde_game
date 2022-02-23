export default anims => {
  anims.create({
    key: 'hit-effect',
    frames:  anims.generateFrameNumbers('hit-sheet', {start: 0, end: 4}),
    frrameRate: 10,
    repeat: 0
  })
}
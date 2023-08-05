function skillsMember(skills) {
    let skillsMember = []
    for (let i = 0; i < skills.length; i++) {
        skillsMember.push(skills[i].skill)
    }
    return skillsMember
}
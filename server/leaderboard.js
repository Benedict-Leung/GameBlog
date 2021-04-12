/**
 * Leaderboard to display scores
 */
class Leaderboard {
    /**
     * 
     * @param {Object[]} playerScores   // Players' scores
     */
    constructor(playerScores) {
        this.playerScores = playerScores;
    }

    /**
     * Update the leaderboard with new scores
     * 
     * @param {Object[]} playerScores   // Updated players' scores
     */
    update(playerScores) {
        this.playerScores = new Map(playerScores);
        $(".leaderboard").remove()
        const scores = new Map([...this.playerScores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5));

        // Create table
        var table = d3.select("body")
                      .append("table")
                      .attr("class", "leaderboard");
        
        // Create header
        table.append("thead")
             .append("tr")
             .selectAll("th")
             .data(["Player", "Kills"])
             .enter()
             .append("th")
             .text((d) => d);

        // Add row
        table.append("tbody")
             .selectAll("tr")
             .data(scores)
             .enter()
             .append("tr")
             .selectAll("td")
             .data((d) => d)
             .enter()
             .append("td")
             .text((d) => d);
    }
}

module.exports = Leaderboard;
import { CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Feedback } from "@shared/schema";

interface FeedbackCardProps {
  feedback: Feedback;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <Card className="mb-4" data-testid="card-feedback">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Response Feedback</CardTitle>
          {feedback.overallScore && (
            <Badge variant="secondary" data-testid="badge-score">
              {feedback.overallScore}/5
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-sm">Strengths</h4>
            </div>
            <ul className="space-y-1 ml-6">
              {feedback.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-muted-foreground list-disc">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.improvements && feedback.improvements.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <h4 className="font-medium text-sm">Areas for Improvement</h4>
            </div>
            <ul className="space-y-1 ml-6">
              {feedback.improvements.map((improvement, idx) => (
                <li key={idx} className="text-sm text-muted-foreground list-disc">
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-sm">Suggestions</h4>
            </div>
            <ul className="space-y-1 ml-6">
              {feedback.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-muted-foreground list-disc">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

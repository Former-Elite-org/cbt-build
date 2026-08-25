import React from "react";
import { Card, CardBody } from "reactstrap";

export default function CustomCard({ title, total, icon }) {
  return (
    <Card className="custom-card border-0">
      <CardBody className="position-relative overflow-hidden">
        <div className="card-content-wrapper mt-2">
          <div className="card-info">
            <h6 className="text-muted mb-2 text-uppercase letter-spacing-1">{title}</h6>
            <h2 className="card-value mb-0 fw-bold">{total}</h2>
          </div>
          <div className="icon-container">
            {icon}
          </div>
        </div>
        <div className="card-decoration"></div>
      </CardBody>
    </Card>
  );
}
